import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  delay,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
  throwError,
} from 'rxjs'

type CustomerType = 'primary' | 'secondary'

interface AutoSearch {
  detail: {
    query: string
    correlationId?: string
    selectedCustomer?: CustomerType
  }
}

interface Account {
  id: string
  customers: {
    username: string
    type: CustomerType
  }[]
}

interface ViewModel {
  account: Account | null
  correlationId: string
  error: string
  isAutoSearch: boolean
  isLoading: boolean
  selectedCustomer: CustomerType | null
}

const database: Account[] = [
  {
    id: '1',
    customers: [
      { username: 'john', type: 'primary' },
      { username: 'jane', type: 'secondary' },
    ],
  },
  { id: '2', customers: [{ username: 'alice', type: 'primary' }] },
]

@Component({
  selector: 'rx-search',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <div>
        <input
          #input
          (input)="input$.next(input.value)"
          (keydown.enter)="onManualSearch$.next()"
          [value]="input$ | async"
          [type]="(queryType$ | async) === 'ssn' ? 'password' : 'text'"
          [disabled]="vm.isLoading"
        />

        <button (click)="onManualSearch$.next()" [disabled]="vm.isLoading">
          Search
        </button>
      </div>

      <ul *ngIf="vm.account?.customers?.length === 2">
        <li *ngFor="let customer of vm.account?.customers">
          <span>{{ customer.username }}</span>
          <button (click)="notifyShell(vm, customer.type)">Select</button>
        </li>
      </ul>

      <div *ngIf="vm.error">{{ vm.error }}</div>

      <pre>{{ vm | json }}</pre>
    </ng-container>
  `,
})
export class RxSearchComponent {
  input$ = new BehaviorSubject('')
  query$ = this.input$.pipe(
    map(input => (input.startsWith('ssn:') ? input.substring(4) : input))
  )
  queryType$ = this.input$.pipe(
    map(input => {
      if (input.startsWith('ssn:')) {
        return 'ssn'
      } else if (input.length > 10) {
        return 'referenceId'
      } else {
        return 'id'
      }
    })
  )

  onManualSearch$ = new Subject<void>()

  // window.dispatchEvent(new CustomEvent('auto-search', { detail: { query: '1', correlationId: 'TEST-FOO', selectedCustomer: 'secondary' } }))
  onAutoSearch$ = fromEvent<AutoSearch>(window, 'auto-search').pipe(
    filter(({ detail: { query } }) => !!query),
    tap(({ detail: { query } }) => this.input$.next(query)),
    map(({ detail }) => detail)
  )

  vm$: Observable<ViewModel> = merge(
    this.onManualSearch$,
    this.onAutoSearch$
  ).pipe(
    map((data: any) => ({
      account: null,
      correlationId:
        data?.correlationId ?? `TEST-${Math.floor(Math.random() * 1000)}`,
      error: '',
      isAutoSearch: !!data,
      isLoading: false,
      selectedCustomer: data?.selectedCustomer ?? null,
    })),
    switchMap((vm: ViewModel) =>
      combineLatest({ query: this.query$, queryType: this.queryType$ }).pipe(
        take(1),
        switchMap(({ query, queryType }) => {
          const params = { query, queryType, correlationId: vm.correlationId }

          return queryType !== 'ssn'
            ? this._search(params, 1000)
            : this._search(params, 500)
        }),
        map(account => ({ ...vm, account })),
        catchError(error => of({ ...vm, error })),
        tap(vm => {
          if (vm.account?.customers.length === 1) {
            this.notifyShell(vm, 'primary')
          } else if (vm.selectedCustomer) {
            this.notifyShell(vm, vm.selectedCustomer)
          }
        }),
        startWith({ ...vm, isLoading: true })
      )
    ),
    startWith({
      account: null,
      correlationId: '',
      error: '',
      isAutoSearch: false,
      isLoading: false,
      selectedCustomer: null,
    })
  )

  notifyShell(vm: ViewModel, selectedCustomer: CustomerType) {
    console.log({ vm, selectedCustomer })
  }

  _search(
    {
      query,
      queryType,
      correlationId,
    }: {
      query: string
      queryType: string
      correlationId: string
    },
    ms: number
  ): Observable<Account> {
    const account = database.find(({ id }) => id === query)

    if (account) {
      return of(account).pipe(delay(1000))
    } else {
      return throwError(() => 'User not found').pipe(delay(500))
    }
  }
}
