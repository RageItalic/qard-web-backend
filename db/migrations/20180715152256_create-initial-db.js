
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('organizations', (table) => {
      table.increments('org_id').primary();
      table.string('org_name');
      table.string('org_account_owner_name');
      table.string('org_owner_email').unique();
      table.string('password_hash');

      table.timestamps(true, true);
    }),

    knex.schema.createTable('events', (table) => {
    	table.increments('event_id').primary();
    	table.string('event_name')
    	table.date('event_date')
    	table.integer('event_owner_id')
    		.references('org_id')
    		.inTable('organizations');

    	table.timestamps(true, true);
    }),

    knex.schema.createTable('attendees', (table) => {
    	table.increments('attendee_id').primary();
    	table.string('attendee_full_name');
    	table.string('attendee_email');
    	table.string('job_title_or_occupation');
    	table.string('company_name');
    	table.string('website_or_portfolio_link');
    	table.string('linkedin')
    	table.integer('event_attended_id')
    		.references('event_id')
    		.inTable('events');

    	table.timestamps(true, true);
    })
  ])
};

exports.down = function(knex, Promise) {
  
};
