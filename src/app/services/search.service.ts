import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, combineLatest, map, of, timer } from 'rxjs'
import { AssociateInterface, ClientInterface } from '../legacy-search.component'

interface ParamsInterface {
  associate: AssociateInterface
  client: ClientInterface
  query: string
  queryType: string
}

interface ResponseInterface {
  id: string
  email: string
}

interface AccountInterface {
  data?: string
  error?: string
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private _httpClient: HttpClient) {}

  search(
    { associate, client, query, queryType }: ParamsInterface,
    sleep: number
  ): Observable<AccountInterface> {
    return combineLatest({
      _: timer(sleep),
      response: this._httpClient
        .get<ResponseInterface>(
          `https://jsonplaceholder.typicode.com/users/${query}`,
          {
            headers: {
              'Associate-Id': associate.id,
              'Associate-Correlation-Id': associate.correlationId,
              'Client-Correlation-Id': client.correlationId,
            },
          }
        )
        .pipe(
          map(({ email }) => ({ data: email })),
          catchError(() => of({ error: 'User not found' }))
        ),
    }).pipe(map(({ response }) => response))
  }
}
