/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('likes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.timestamp('liked_at').defaultTo(knex.fn.now());
    
    // Prevent duplicate likes
    table.unique(['user_id', 'post_id']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['post_id']);
    table.index(['liked_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('likes');
};
