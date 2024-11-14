// Define constants for the supported database providers
enum DatabaseProviders {
  FIREBASE = "firebase",
  POSTGRES = "postgres",
  MONGO = "mongo",
}

// Generic factory function to get the repository for any entity
export const factoryRepository = <T>(
  mongoRepo?: () => T,
  postgresRepo?: () => T,
  firebaseRepo?: () => T
): T => {
  const provider = Bun.env.DATABASE_PROVIDER as DatabaseProviders;

  switch (provider) {
    case DatabaseProviders.FIREBASE:
      if (!firebaseRepo) throw new Error("Firebase repository not provided");
      return firebaseRepo();
    case DatabaseProviders.POSTGRES:
      if (!postgresRepo) throw new Error("Postgres repository not provided");
      return postgresRepo();
    case DatabaseProviders.MONGO:
      if (!mongoRepo) throw new Error("MongoDB repository not provided");
      return mongoRepo();
    default:
      throw new Error(`Unsupported database provider: ${provider}`);
  }
};
