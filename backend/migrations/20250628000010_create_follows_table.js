/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('follows', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('follower_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('following_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('followed_at').defaultTo(knex.fn.now());
    
    // Prevent self-following and duplicate follows
    table.unique(['follower_id', 'following_id']);
    table.check('follower_id != following_id');
    
    // Indexes
    table.index(['follower_id']);
    table.index(['following_id']);
    table.index(['followed_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('follows');
};
