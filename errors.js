import { createError } from 'apollo-errors';

export const NotFound = createError('NotFound', {
  message: 'Entity not found'
});