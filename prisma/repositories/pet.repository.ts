import { Pet } from "./entities/pet.entity";
import { prismaClient } from "./prismaClient";

export interface IPetsRepository {
  prismaClient: typeof prismaClient;
  findPets(query?: any): Promise<Pet[]>;
  findPetsById(id: string): Promise<any>;
  createPet(pet: any): Promise<any>;
  createManyPet(pet: Pet[]): Promise<any>;
  updatePet(id: string, pet: any): Promise<any>;
  updateByNftId(nft_id: string, pet: Pet): Promise<any>;
  deletePet(id: string): Promise<any>;
}

export class PetsPrismaORMRepository implements IPetsRepository {
  prismaClient: typeof prismaClient;
  constructor() {
    this.prismaClient = prismaClient;
  }
  async findPets(query?: any): Promise<any> {
    try {
      return this.prismaClient.pet.findMany({ where: query });
    } catch (err) {
      console.log({ err });
    }
  }

  async findPetsById(id: string): Promise<any> {
    try {
      return this.prismaClient.pet.findUnique({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async updateByNftId(nft_id: string, pet: Pet) {
    return;
  }

  async createPet(pet: Pet): Promise<any> {
    try {
      const createResult = await this.prismaClient.pet.create({
        data: pet,
      });
      return createResult;
    } catch (err) {
      console.log({ err });
    }

    // console.log({ createResult, pet });
  }
  async createManyPet(pet: Pet[]): Promise<any> {
    try {
      return this.prismaClient.pet.createMany({
        data: pet,
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async updatePet(id: string, pet: Partial<Pet>): Promise<any> {
    try {
      return this.prismaClient.pet.update({
        where: {
          id,
        },
        data: pet,
      });
    } catch (err) {
      console.log({ err });
    }
  }

  async deletePet(id: string): Promise<any> {
    try {
      return this.prismaClient.pet.delete({
        where: {
          id,
        },
      });
    } catch (err) {
      console.log({ err });
    }
  }
}
