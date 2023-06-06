import { Injectable } from '@angular/core'
import { JWK, JWE } from 'node-jose'
import { QueryType } from 'src/components/search.component'

interface AccountResponseInterface {
  id: number
  email: string
  username: string
}

export interface AccountInterface {
  id: number
  username: string
}

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  async search(
    query: string,
    queryType: QueryType,
    delay: number = 1000
  ): Promise<AccountInterface | null> {
    try {
      if (queryType === 'ssn') {
        const encryptedQuery = await this._encrypt(query)

        if (!encryptedQuery) {
          throw new Error('Encryption failed.')
        }

        query = encryptedQuery
      }

      const [response] = await Promise.all([
        fetch(`https://jsonplaceholder.typicode.com/users/${query}`),
        new Promise(r => setTimeout(r, delay)),
      ])

      if (!response.ok) {
        return null
      }

      const { id, username } =
        (await response.json()) as AccountResponseInterface

      return { id, username }
    } catch (_) {
      return null
    }
  }

  private async _encrypt(query: string): Promise<string | null> {
    try {
      const jwk = await JWK.asKey({
        kty: 'EC',
        use: 'enc',
        crv: 'P-256',
        x: 'qP-HIndD2pbLFeMGHnzcRQfqLn9bzEbp-tn0tfW8WYY',
        y: '-2vnkbBkSKKOlTnKXEil3f1qxlqZnehognw0Owd7UZ8',
        alg: 'ECDH-ES',
      })

      const jwe = await JWE.createEncrypt(
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

      return jwe
    } catch (_) {
      return null
    }
  }
}
