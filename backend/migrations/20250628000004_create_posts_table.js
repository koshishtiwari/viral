/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('posts', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE');
    table.text('caption');
    table.json('media'); // Array of {type: 'image'|'video', url: string, thumbnail?: string}
    table.json('tags'); // Array of hashtags
    table.integer('likes_count').defaultTo(0);
    table.integer('comments_count').defaultTo(0);
    table.integer('shares_count').defaultTo(0);
    table.integer('views_count').defaultTo(0);
    table.integer('votes_count').defaultTo(0); // For live session voting
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_featured').defaultTo(false);
    table.enum('type', ['product', 'story', 'live_announcement']).defaultTo('product');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['user_id']);
    table.index(['product_id']);
    table.index(['is_active']);
    table.index(['is_featured']);
    table.index(['type']);
    table.index(['created_at']);
    table.index(['votes_count']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('posts');
};
