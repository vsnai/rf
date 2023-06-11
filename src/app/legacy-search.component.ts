import { ChangeDetectionStrategy, Component, HostListener } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  BehaviorSubject,
  combineLatest,
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
} from 'rxjs'
import { SearchService } from './services/search.service'
import { v4 as uuidv4 } from 'uuid'
import { EncryptionService } from './services/encryption.service'

type CustomerType = 'primary' | 'secondary'

interface DataInterface {
  isLoading?: boolean
  data?: any
  error?: string
}

export interface ClientInterface {
  correlationId: string
}

export interface AssociateInterface {
  id: string
  correlationId: string
}

interface OnInitInterface {
  detail: {
    associate: AssociateInterface
  }
}

interface OnAutoSearchInterface {
  detail: {
    input: string
    correlationId?: string
    selectedCustomer?: CustomerType
  }
}

@Component({
  selector: 'legacy-search-component',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="data$ | async as vm">
      <input
        autocomplete="off"
        placeholder="Search ..."
        #input
        (input)="input$.next(input.value)"
        (keyup.enter)="input.value && onManualSearch$.next()"
        [type]="inputType$ | async"
        [disabled]="vm.isLoading"
        [value]="input$ | async"
      />

      <button
        (click)="input.value && onManualSearch$.next()"
        [disabled]="vm.isLoading"
      >
        Go
      </button>

      <pre>{{ vm | json }}</pre>
    </ng-container>
  `,
})
export class LegacySearchComponent {
  associate$ = new BehaviorSubject<AssociateInterface>({
    id: 'missing',
    correlationId: 'missing',
  })

  client$ = new BehaviorSubject<ClientInterface>({
    correlationId: `DEMO-${uuidv4()}`,
  })

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

  inputType$ = this.queryType$.pipe(
    map(queryType => (queryType === 'ssn' ? 'password' : 'text'))
  )

  onManualSearch$ = new Subject<void>()

  // window.dispatchEvent(new CustomEvent('search-ui:auto-search', { detail: { input: '3', correlationId: 'hahaha' }}))
  onAutoSearch$ = fromEvent<OnAutoSearchInterface>(
    window,
    'search-ui:auto-search'
  ).pipe(
    tap(({ detail: { input } }) => this.input$.next(input)),
    map(({ detail }) => detail)
  )

  data$: Observable<DataInterface> = merge(
    this.onManualSearch$,
    this.onAutoSearch$
  ).pipe(
    switchMap(data =>
      combineLatest({
        associate: this.associate$,
        client: data?.correlationId
          ? of({ correlationId: data.correlationId })
          : of({ correlationId: `DEMO-${uuidv4()}` }),
        query: this.query$,
        queryType: this.queryType$,
      }).pipe(
        take(1),
        switchMap(({ associate, client, query, queryType }) =>
          queryType !== 'ssn'
            ? this._searchService.search(
                {
                  associate,
                  client,
                  query,
                  queryType,
                },
                1000
              )
            : this._encryptionService
                .encrypt(
                  {
                    associate,
                    client,
                    query,
                    queryType,
                  },
                  500
                )
                .pipe(
                  switchMap(({ data: jwe, error }) =>
                    jwe
                      ? this._searchService.search(
                          {
                            associate,
                            client,
                            query: jwe,
                            queryType,
                          },
                          500
                        )
                      : of({ error })
                  )
                )
        ),
        startWith({ isLoading: true })
      )
    ),
    startWith({ isLoading: false })
  )

  constructor(
    private _searchService: SearchService,
    private _encryptionService: EncryptionService
  ) {}

  // window.dispatchEvent(new CustomEvent('search-ui:init', { detail: { associate: { id: '3', correlationId: 'foo' } }}))
  @HostListener('window:search-ui:init', ['$event'])
  onInit({ detail: { associate } }: OnInitInterface) {
    this.associate$.next(associate)
  }
}
