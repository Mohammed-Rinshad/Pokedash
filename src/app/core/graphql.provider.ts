import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { ApolloClientOptions, InMemoryCache } from '@apollo/client/core';
import { Apollo } from 'apollo-angular';
import { HttpLink } from 'apollo-angular/http';
import { environment } from '../../environments/environment';

export function initializeApollo(apollo: Apollo, httpLink: HttpLink) {
  return () => {
    // Default client for PokéAPI
    apollo.create({
      link: httpLink.create({ uri: environment.graphqlPokeApiUrl }),
      cache: new InMemoryCache(),
    });

    // Local mock server client (json-graphql-server serves at root, not /graphql)
    apollo.create({
      link: httpLink.create({ uri: environment.graphqlLocalApiUrl }),
      cache: new InMemoryCache(),
    }, 'local');
  };
}

export const graphqlProvider: ApplicationConfig['providers'] = [
  Apollo,
  {
    provide: APP_INITIALIZER,
    useFactory: initializeApollo,
    deps: [Apollo, HttpLink],
    multi: true,
  },
];
