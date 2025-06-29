/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('username').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name');
    table.string('last_name');
    table.string('phone_number');
    table.text('bio');
    table.string('profile_image_url');
    table.enum('role', ['buyer', 'seller', 'admin']).defaultTo('buyer');
    table.boolean('is_verified').defaultTo(false);
    table.boolean('is_active').defaultTo(true);
    table.boolean('is_seller_verified').defaultTo(false);
    table.json('address'); // Store as JSON: {street, city, state, zip, country}
    table.string('verification_token');
    table.timestamp('verification_token_expires');
    table.string('reset_password_token');
    table.timestamp('reset_password_expires');
    table.integer('followers_count').defaultTo(0);
    table.integer('following_count').defaultTo(0);
    table.decimal('seller_rating', 3, 2).defaultTo(5.00);
    table.integer('total_sales').defaultTo(0);
    table.timestamps(true, true);
    
    // Indexes
    table.index(['email']);
    table.index(['username']);
    table.index(['role']);
    table.index(['is_verified']);
    table.index(['is_seller_verified']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
