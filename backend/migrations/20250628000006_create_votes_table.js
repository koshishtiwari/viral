/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('votes', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.enum('vote_type', ['live_session', 'product_feature', 'general']).defaultTo('live_session');
    table.timestamp('voted_at').defaultTo(knex.fn.now());
    table.json('metadata'); // Additional vote context
    
    // Composite primary key to prevent duplicate votes
    table.unique(['user_id', 'post_id', 'vote_type']);
    
    // Indexes
    table.index(['user_id']);
    table.index(['post_id']);
    table.index(['vote_type']);
    table.index(['voted_at']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('votes');
};
