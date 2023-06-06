import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  WritableSignal,
  computed,
  signal,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { AccountInterface, AccountService } from '../services/account.service'

export type QueryType = 'id' | 'referenceId' | 'ssn'

@Component({
  selector: 'search-component',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [AccountService],
  template: `
    <input
      (input)="input.set($any($event.target).value)"
      [value]="input()"
      [disabled]="isLoading()"
      [type]="queryType() === 'ssn' ? 'password' : 'text'"
      (keyup.enter)="onSearch()"
    />

    <button [disabled]="isLoading()" (click)="onSearch()">
      {{ isLoading() ? 'Loading ...' : 'Search' }}
    </button>

    <pre>{{ [queryType(), isLoading(), data(), error()] | json }}</pre>
    <pre>{{ ssn() | json }}</pre>
  `,
})
export class SearchComponent {
  input = signal('')
  isLoading = signal(false)

  data: WritableSignal<AccountInterface | null> = signal(null)
  error: WritableSignal<string | null> = signal(null)

  query = computed(() => {
    return this.input().startsWith('ssn:')
      ? this.input().substring(4)
      : this.input()
  })
  queryType: Signal<QueryType> = computed(() => {
    if (this.input().startsWith('ssn:')) {
      return 'ssn'
    }

    if (this.input().length > 6) {
      return 'referenceId'
    }

    return 'id'
  })

  ssn = computed(() => {
    if (!this.input().startsWith('ssn:')) {
      return { mask: '', isValid: false }
    }

    return {
      mask: this.query().replace(/.(?=.{1,}$)/g, '*'),
      isValid: !!this.query().match(/^\d{9}$/),
    }
  })

  constructor(private _accountService: AccountService) {}

  async onSearch() {
    this.data.set(null)
    this.error.set(null)

    if (!this.query()) {
      return
    }

    this.isLoading.set(true)

    const data = await this._accountService.search(
      this.query(),
      this.queryType()
    )

    if (data) {
      this.data.set(data)
    } else {
      this.error.set('Account not found.')
    }

    this.isLoading.set(false)
  }
}
