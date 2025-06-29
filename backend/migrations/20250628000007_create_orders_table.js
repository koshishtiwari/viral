/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('orders', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('order_number').unique().notNullable();
    table.uuid('buyer_id').references('id').inTable('users').onDelete('RESTRICT');
    table.uuid('seller_id').references('id').inTable('users').onDelete('RESTRICT');
    table.uuid('live_session_id').references('id').inTable('live_sessions').onDelete('SET NULL');
    table.enum('status', [
      'pending',
      'confirmed', 
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'disputed'
    ]).defaultTo('pending');
    table.decimal('subtotal', 10, 2).notNullable();
    table.decimal('tax_amount', 10, 2).defaultTo(0);
    table.decimal('shipping_amount', 10, 2).defaultTo(0);
    table.decimal('discount_amount', 10, 2).defaultTo(0);
    table.decimal('total_amount', 10, 2).notNullable();
    table.string('currency', 3).defaultTo('USD');
    table.json('shipping_address');
    table.json('billing_address');
    table.string('payment_method');
    table.string('payment_intent_id'); // Stripe payment intent
    table.string('tracking_number');
    table.string('shipping_carrier');
    table.timestamp('shipped_at');
    table.timestamp('delivered_at');
    table.string('delivery_photo_url'); // For escrow release
    table.boolean('delivery_confirmed').defaultTo(false);
    table.timestamp('escrow_released_at');
    table.text('notes');
    table.timestamps(true, true);
    
    // Indexes
    table.index(['order_number']);
    table.index(['buyer_id']);
    table.index(['seller_id']);
    table.index(['live_session_id']);
    table.index(['status']);
    table.index(['created_at']);
    table.index(['delivery_confirmed']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('orders');
};
