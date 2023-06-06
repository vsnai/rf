import { AccountService } from './account.service'
import { JWK, JWE } from 'node-jose'

describe(AccountService.name, () => {
  let service: AccountService
  // let encryptionService: ReturnType<jest.Mock> = {
  //   encrypt: jest.fn((query, queryType) => {
  //     if (query === '1' && queryType === 'ssn') {
  //       return 'jwe'
  //     } else {
  //       return null
  //     }
  //   }),
  // }

  beforeEach(() => {
    service = new AccountService()
  })

  test('search(): id | success', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 1,
        username: 'john',
        email: 'john@example.com',
      }),
    })

    const response = await service.search('1', 'id', 0)

    expect(response).toEqual({ id: 1, username: 'john' })
  })

  test('search(): id | error - no user', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false })

    const response = await service.search('1', 'id', 0)

    expect(response).toBe(null)
  })

  test('search(): id | error - fetch problem', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true })

    const response = await service.search('1', 'id', 0)

    expect(response).toBe(null)
  })

  test('search(): id | error - with setTimeout', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false })
    jest.useFakeTimers()

    const responsePromise = service.search('1', 'id')
    jest.runAllTimers()
    const response = await responsePromise

    expect(response).toBe(null)
    jest.useRealTimers()
  })

  test('search(): ssn | error - no user', async () => {
    jest.spyOn(JWE, 'createEncrypt').mockReturnValueOnce({
      update: () => ({
        final: () => Promise.resolve('val'),
      }),
    })

    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false })

    const response = await service.search('1', 'ssn', 0)

    expect(response).toBe(null)
  })
})
