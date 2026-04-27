import {
  Injectable, NotFoundException, ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
  ) {}

  async getListe(tenantId: string, opts: { page?: number; limite?: number; search?: string; role?: string }) {
    const { page = 1, limite = 20, search, role } = opts;
    const skip = (page - 1) * limite;

    const where: any = { tenantId, deletedAt: null };
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { nom:    { contains: search, mode: 'insensitive' as const } },
        { prenom: { contains: search, mode: 'insensitive' as const } },
        { email:  { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limite,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true, nom: true, prenom: true, email: true,
          role: true, telephone: true, actif: true,
          derniereConnexion: true, createdAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, totalPages: Math.ceil(total / limite) };
  }

  async getUn(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      select: {
        id: true, nom: true, prenom: true, email: true,
        role: true, telephone: true, actif: true,
        derniereConnexion: true, createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }

  async creer(tenantId: string, dto: CreateUserDto) {
    const existant = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId, deletedAt: null },
    });
    if (existant) throw new ConflictException('Cet email est déjà utilisé dans ce tenant');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        tenantId,
        nom: dto.nom,
        prenom: dto.prenom,
        email: dto.email,
        passwordHash,
        role: dto.role,
        telephone: dto.telephone,
      },
      select: {
        id: true, nom: true, prenom: true, email: true,
        role: true, telephone: true, actif: true, createdAt: true,
      },
    });

    // Email de bienvenue asynchrone (fire-and-forget)
    this.queue.envoyerEmail({
      to: dto.email,
      subject: 'Bienvenue sur GISAC ERP',
      template: 'bienvenue',
      tenantId,
      data: { prenom: dto.prenom ?? '', nom: dto.nom, email: dto.email, role: dto.role },
    });

    return user;
  }

  async modifier(tenantId: string, id: string, dto: Partial<CreateUserDto>) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const data: any = {};
    if (dto.nom)       data.nom = dto.nom;
    if (dto.prenom !== undefined) data.prenom = dto.prenom;
    if (dto.role)      data.role = dto.role;
    if (dto.telephone !== undefined) data.telephone = dto.telephone;

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
      data.refreshTokenHash = null; // invalider toutes les sessions
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, nom: true, prenom: true, email: true,
        role: true, telephone: true, actif: true,
      },
    });
  }

  async toggleActif(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return this.prisma.user.update({
      where: { id },
      data: {
        actif: !user.actif,
        // Révoquer les sessions si on désactive
        refreshTokenHash: user.actif ? null : user.refreshTokenHash,
      },
      select: { id: true, actif: true },
    });
  }

  async reinitialiserMotDePasse(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Générer un mot de passe temporaire
    const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash, refreshTokenHash: null },
    });

    // Envoyer le mot de passe temporaire par email — jamais en clair dans la réponse API
    this.queue.envoyerEmail({
      to: user.email,
      subject: 'Réinitialisation de votre mot de passe — GISAC ERP',
      template: 'reset_password',
      tenantId,
      data: { prenom: user.prenom ?? '', nom: user.nom, tempPassword },
    });

    return { message: 'Mot de passe temporaire envoyé par email' };
  }

  async supprimer(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), actif: false, refreshTokenHash: null },
    });
    return { message: 'Utilisateur supprimé' };
  }
}
