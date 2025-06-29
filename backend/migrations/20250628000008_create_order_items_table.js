/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('order_items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('RESTRICT');
    table.string('product_title'); // Snapshot at time of order
    table.string('product_sku');
    table.json('product_variant'); // Size, color, etc.
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.string('product_image_url'); // Snapshot at time of order
    table.timestamps(true, true);
    
    // Indexes
    table.index(['order_id']);
    table.index(['product_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('order_items');
};
