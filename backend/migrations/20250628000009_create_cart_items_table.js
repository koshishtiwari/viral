/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cart_items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.string('product_variant_hash'); // Hash of the variant JSON for uniqueness
    table.json('product_variant'); // Size, color, etc.
    table.integer('quantity').notNullable();
    table.timestamps(true, true);
    
    // Prevent duplicate cart items for same product/variant
    table.unique(['user_id', 'product_id', 'product_variant_hash']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['product_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('cart_items');
};
