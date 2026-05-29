import { ApplicationConfig } from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { Apollo, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../environments/environment';

/**
 * Factory function to initialize the Apollo Client.
 * Configured with the public PokéAPI endpoint by default.
 * 
 * @param httpLink - The Apollo HttpLink service injected by Angular.
 * @returns ApolloClientOptions object containing link and cache setup.
 */
export function createApollo(httpLink: HttpLink): ApolloClientOptions {
  return {
    link: httpLink.create({ uri: environment.graphqlPokeApiUrl }),
    cache: new InMemoryCache(), // Standard in-memory cache for fast subsequent reads
  };
}

/**
 * Standalone provider array for GraphQL configuration.
 * To be imported into app.config.ts providers array.
 */
export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APOLLO_OPTIONS,
    useFactory: createApollo,
    deps: [HttpLink],
  },
];
