/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('live_sessions', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('seller_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('post_id').references('id').inTable('posts').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('description');
    table.string('ivs_channel_arn');
    table.string('ivs_playback_url');
    table.string('ivs_ingest_endpoint');
    table.string('ivs_stream_key');
    table.enum('status', ['scheduled', 'live', 'ended', 'cancelled']).defaultTo('scheduled');
    table.timestamp('scheduled_start_time');
    table.timestamp('actual_start_time');
    table.timestamp('end_time');
    table.integer('duration_seconds').defaultTo(300); // 5 minutes default
    table.integer('viewers_count').defaultTo(0);
    table.integer('peak_viewers').defaultTo(0);
    table.integer('votes_required').defaultTo(10);
    table.integer('total_votes').defaultTo(0);
    table.decimal('total_revenue', 10, 2).defaultTo(0);
    table.integer('total_orders').defaultTo(0);
    table.json('products_featured'); // Array of product IDs
    table.boolean('is_recurring').defaultTo(false);
    table.string('recurring_pattern'); // daily, weekly, etc.
    table.timestamps(true, true);
    
    // Indexes
    table.index(['seller_id']);
    table.index(['post_id']);
    table.index(['status']);
    table.index(['scheduled_start_time']);
    table.index(['actual_start_time']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('live_sessions');
};
