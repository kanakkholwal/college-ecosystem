import {
    createSearchParamsCache,
    parseAsInteger,
    parseAsString
} from 'nuqs/server'
// Note: import from 'nuqs/server' to avoid the "use client" directive

export const searchParamsCache = createSearchParamsCache({
    // List your search param keys and associated parsers here:
    query: parseAsString.withDefault(''),
    page: parseAsInteger.withDefault(1),

    batch: parseAsString.withDefault('all'),
    branch: parseAsString.withDefault('all'),
    programme: parseAsString.withDefault('all'),

    cache: parseAsString.withDefault(''),

    freshers: parseAsString.withDefault('0'),
    
})