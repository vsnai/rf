import { SearchComponent } from './search.component'

describe(SearchComponent.name, () => {
  let component: SearchComponent
  let userService: ReturnType<jest.Mock> = {
    search: jest.fn((query, queryType) => {
      return query === '1' ? { id: 1, username: 'john' } : null
    }),
  }

  beforeEach(() => {
    component = new SearchComponent(userService)
  })

  test('onSearch(): blank', async () => {
    component.input.set('')

    await component.onSearch()

    expect(component.data()).toBe(null)
    expect(component.error()).toBe(null)
  })

  test('onSearch(): success', async () => {
    component.input.set('1')

    await component.onSearch()

    expect(component.data()).toEqual({ id: 1, username: 'john' })
    expect(component.error()).toBe(null)
  })

  test('onSearch(): error', async () => {
    component.input.set('2')

    await component.onSearch()

    expect(component.data()).toBe(null)
    expect(component.error()).toBe('Account not found.')
  })

  test('queryType(): ssn', async () => {
    component.input.set('ssn:1')

    expect(component.queryType()).toBe('ssn')
  })

  test('queryType(): referenceId', async () => {
    component.input.set('123456789')

    expect(component.queryType()).toBe('referenceId')
  })

  test('ssn(): blank', async () => {
    component.input.set('123456789')

    expect(component.ssn()).toEqual({ mask: '', isValid: false })
  })

  test('ssn(): invalid', async () => {
    component.input.set('ssn:12345678')

    expect(component.ssn()).toEqual({ mask: '*******8', isValid: false })
  })

  test('ssn(): valid', async () => {
    component.input.set('ssn:123456789')

    expect(component.ssn()).toEqual({ mask: '********9', isValid: true })
  })
})
