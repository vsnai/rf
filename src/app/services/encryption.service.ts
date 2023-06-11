import { Injectable } from '@angular/core'
import {
  Observable,
  catchError,
  combineLatest,
  from,
  map,
  of,
  switchMap,
  timer,
} from 'rxjs'
import { JWK, JWE } from 'node-jose'
import { AssociateInterface, ClientInterface } from '../legacy-search.component'

interface ParamsInterface {
  associate: AssociateInterface
  client: ClientInterface
  query: string
  queryType: string
}

interface ResponseInterface {
  keys: {
    alg: string
    crv: string
    kty: string
    use: string
    x: string
    y: string
  }[]
}

interface EncryptionInterface {
  data?: string
  error?: string
}

@Injectable({ providedIn: 'root' })
export class EncryptionService {
  encrypt(
    { associate, client, query, queryType }: ParamsInterface,
    sleep: number
  ): Observable<EncryptionInterface> {
    return combineLatest({
      _: timer(sleep),
      response: of<ResponseInterface>({
        keys: [
          {
            alg: 'ECDH-ES',
            crv: 'P-256',
            kty: 'EC',
            use: 'enc',
            x: 'qP-HIndD2pbLFeMGHnzcRQfqLn9bzEbp-tn0tfW8WYY',
            y: '-2vnkbBkSKKOlTnKXEil3f1qxlqZnehognw0Owd7UZ8',
          },
        ],
      }).pipe(
        switchMap(({ keys }) =>
          from(JWK.asKey(keys[0])).pipe(
            switchMap(jwk =>
              from(
                JWE.createEncrypt(
                  {
                    format: 'compact',
                    contentAlg: 'A256GCM',
                    fields: {
                      alg: 'ECDH-ES',
                      enc: 'A256GCM',
                    },
                  },
                  jwk
                )
                  .update(query)
                  .final()
              )
            )
          )
        ),
        map(jwe => ({ data: jwe })),
        catchError(() => of({ error: 'Encryption failed' }))
      ),
    }).pipe(map(({ response }) => response))
  }
}
