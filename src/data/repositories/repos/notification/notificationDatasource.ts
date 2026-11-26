import { NotificationRepository } from "@domain/repositories/notification";

// Same operations as the repository (the API is the only source, nothing is cached).
export type NotificationDatasource = NotificationRepository;
