import { UserModel } from "@/db/schema";
import type { NewUser, UpdateUser, User } from "@/db/schema";
import { logger } from "@/lib/logger";

export namespace UsersService {
  /**
   * Creates a new user in the database
   * @param payload - The new user's data'
   */
  export async function create(payload: NewUser): Promise<NewUser> {
    try {
      const user = await UserModel.insertOne(payload);

      logger.audit("new user created", {
        module: "users",
        action: "service:create",
      });

      return user;
    } catch (err) {
      logger.error("error creating user", {
        module: "users",
        action: "service:create",
        error: err,
      });

      throw err;
    }
  }

  /**
   * Find a user by email (excluding soft-deleted users)
   * @param email - The user's email
   * @param options extra options for a query
   */
  export async function findByEmail(
    email: string,
    options?: {
      /**
       * Include soft-deleted users in the search
       */
      includeDeleted?: boolean;
    },
  ): Promise<User> {
    try {
      const query: { email: string; deletedAt?: null } = { email };

      // If not including deleted users, filter them out
      if (!options?.includeDeleted) {
        query.deletedAt = null;
      }

      const user = await UserModel.findOne(query);
      return user;
    } catch (err) {
      logger.error("error finding user by email", {
        module: "users",
        action: "service:findByEmail",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Find a user by provider account ID (excluding soft-deleted users)
   * @param providerAccountId - The provider account ID
   * @param options extra options for a query
   */
  export async function findByProviderAccountId(
    providerAccountId: string,
    options?: {
      /**
       * Include soft-deleted users in the search
       */
      includeDeleted?: boolean;
    },
  ): Promise<User> {
    try {
      const query: { providerAccountId: string; deletedAt?: null } = { providerAccountId };

      // If not including deleted users, filter them out
      if (!options?.includeDeleted) {
        query.deletedAt = null;
      }

      const user = await UserModel.findOne(query);
      return user;
    } catch (err) {
      logger.error("error finding user by provider account id", {
        module: "users",
        action: "service:findByProviderAccountId",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Creates or updates a user (upsert pattern to prevent race conditions)
   * @param payload - The user's data
   */
  export async function upsertByProviderAccountId(payload: NewUser): Promise<User> {
    try {
      const user = await UserModel.findOneAndUpdate(
        { providerAccountId: payload.providerAccountId },
        { $set: payload },
        {
          upsert: true,
          new: true,
          runValidators: true,
        },
      );
      return user;
    } catch (err) {
      logger.error("error upserting user by provider account id", {
        module: "users",
        action: "service:upsertByProviderAccountId",
        error: err,
      });
      throw err;
    }
  }

  /**
   * Update a user by id
   * @param id id of the user to update
   * @param payload new details to update
   */
  export async function updateById(id: string, payload: UpdateUser): Promise<User> {
    try {
      const updatedUser = await UserModel.findOneAndUpdate(
        { _id: id },
        { $set: payload },
        { new: true },
      );
      return updatedUser;
    } catch (err) {
      logger.error("error updating user by id", {
        module: "users",
        action: "service:updateById",
        error: err,
      });

      throw err;
    }
  }
}
