import { getEntityManager } from "@typedorm/core";

export class BaseCrudService {
  /**
   * Retrieves a list of entities from the database.
   *
   * @param {new () => T & any} EntityClass - The class of the entity to retrieve.
   * @param {boolean} filterWithDeletedField - Whether to filter out deleted entities.
   * @return {Promise<T[]>} A promise that resolves to an array of retrieved entities.
   */
  public static async list<T>(
    EntityClass: new () => T & any,
    filterWithDeletedField: boolean = false
  ): Promise<{ items: T[] }> {
    const entityManager = getEntityManager();

    const filter = filterWithDeletedField
      ? { where: { deleted: { EQ: false } } }
      : undefined;

    return await entityManager.find(EntityClass, {}, filter);
  }

  public static async listWithFilter<T>(
    EntityClass: new () => T & any,
    customFilter?: any
  ): Promise<{ items: T[] }> {
    const entityManager = getEntityManager();

    let filter: any = customFilter || {};

    return await entityManager.find(EntityClass, {}, filter);
  }

  /**
   * Retrieves an entity by its ID.
   *
   * @param {string} id - The ID of the entity.
   * @param {new () => T & any} EntityClass - The class of the entity.
   * @returns {Promise<T>} A promise that resolves to the entity with the given ID.
   */
  public static async getById<T>(
    id: string,
    EntityClass: new () => T & any
  ): Promise<T> {
    const entityManager = getEntityManager();
    return await entityManager.findOne(EntityClass, { id });
  }

  /**
   * Retrieves an array of objects by a specific attribute value.
   *
   * @param {string} attribute - The attribute to filter by.
   * @param {string} value - The value to filter by.
   * @param {new () => T & any} EntityClass - The class of the entity to retrieve.
   * @returns {Promise<T[]>} An array of objects matching the attribute value.
   */
  public static async getByAttribute<T>(
    attribute: string,
    value: string,
    EntityClass: new () => T & any
  ): Promise<T[]> {
    const entityManager = getEntityManager();

    const filter: any = {
      where: { [attribute]: { EQ: value } },
    };
    const result = await entityManager.find(EntityClass, {}, filter);
    return result.items;
  }

  /**
   * Creates a new entity of type T using the provided body and returns it.
   *
   * @param {any} body - The body object used to create the entity.
   * @param {new () => T & any} EntityClass - The class of the entity.
   * @return {Promise<T>} A promise that resolves to the created entity.
   */
  public static async create<T>(
    body: any,
    EntityClass: new () => T & any
  ): Promise<T> {
    const entityManager = getEntityManager();

    const item = new EntityClass();
    Object.assign(item, body);

    return await entityManager.create(item);
  }

  /**
   * Updates a record in the database.
   *
   * @param {string} recordId - The ID of the record to update.
   * @param {any} updatePayload - The payload containing the updated data.
   * @param {new () => T & any} EntityClass - The class of the entity to update.
   * @return {Promise<void>} - A promise that resolves when the record is updated.
   */
  public static async update<T>(
    recordId: string,
    updatePayload: any,
    EntityClass: new () => T & any
  ): Promise<T> {
    const entityManager = getEntityManager();

    const item = await entityManager.findOne(EntityClass, { id: recordId });
    if (!item) {
      throw new Error("Item not found");
    }

    return await entityManager.update(
      EntityClass,
      { id: recordId },
      updatePayload
    );
  }

  /**
   * Removes an entity from the database.
   *
   * @param {string} id - The ID of the entity to be removed.
   * @param {new () => T & any} EntityClass - The class of the entity to be removed.
   * @returns {Promise<{ success: boolean }>} - A promise that resolves to an object indicating whether the removal was successful.
   */
  public static async remove<T>(
    id: string,
    EntityClass: new () => T & any
  ): Promise<{ success: boolean }> {
    const entityManager = getEntityManager();

    const item = await entityManager.findOne(EntityClass, { id });
    if (!item) {
      throw new Error("Item not found");
    }

    return await entityManager.delete(EntityClass, { id });
  }

  /**
   * Deletes all entities of the specified class.
   *
   * @param {new () => T & any} EntityClass - The class of the entities to be deleted.
   * @param {string[]} primaryKeys - The primary keys of the entities.
   * @returns {Promise<void>} A promise that resolves when all entities have been deleted.
   */
  public static async removeAll<T>(
    EntityClass: new () => T & any,
    primaryKeys: string[] = ["id"]
  ): Promise<void> {
    const entityManager = getEntityManager();
    const items = await entityManager.find(EntityClass, {});

    if (items.items?.length) {
      await Promise.all(
        items.items.map((item) => {
          let payload: any = {};

          primaryKeys.forEach((key) => {
            payload[key] = item[key];
          });

          return entityManager.delete(EntityClass, payload);
        })
      );
    }
  }

  /**
   * Checks if an item with the given ID exists in the database.
   *
   * @param {string} id - The ID of the item to check.
   * @param {new () => T & any} EntityClass - The class of the entity to check.
   * @return {Promise<boolean>} A boolean indicating whether the item exists or not.
   */
  public static async isExists<T>(
    id: string,
    EntityClass: new () => T & any
  ): Promise<boolean> {
    const entityManager = getEntityManager();

    const item = await entityManager.exists(EntityClass, { id });
    return !!item;
  }
}
