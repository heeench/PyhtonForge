import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const events=sqliteTable('training_events',{id:text('id').primaryKey(),owner:text('owner').notNull(),created:integer('created').notNull(),payload:text('payload').notNull()},t=>[index('idx_training_owner_created').on(t.owner,t.created)]);
