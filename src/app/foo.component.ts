import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component } from '@angular/core'
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  merge,
  of,
  startWith,
  switchMap,
  take,
  timer,
} from 'rxjs'

interface ViewModel {
  isLoading: boolean
  data?: string
  error?: string
}

@Component({
  selector: 'foo-component',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
      }

      :host > nav {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        background: #eee;
      }

      :host > main {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
      }

      /* Transitions: With Data */
      :host > nav > header.hide {
        opacity: 0;
        height: 0;
        transition: opacity 0.2s, height 0.2s 0.2s;
      }

      :host > nav.expand {
        height: 100%;
        border-bottom: 1px solid #eee;
        transition: height 0.2s 0.4s, border-bottom 0.2s 0.4s;
      }

      :host > main.show {
        height: 100%;
        opacity: 1;
        transition: height 0.2s 0.6s, opacity 0.2s 0.6s;
      }

      /* Transitions: No Data */
      :host > main.hide {
        height: 0;
        opacity: 0;
        transition: opacity 0.2s, height 0.2s;
      }

      :host > nav.collapse {
        height: 8rem;
        border-bottom: 1px solid #ddd;
        transition: height 0.2s 0.2s, border-bottom 0.2s 0.2s;
      }

      :host > nav > header.show {
        opacity: 1;
        height: 8rem;
        transition: height 0.2s 0.4s, opacity 0.2s 0.6s;
      }
    `,
  ],
  template: `
    <ng-container *ngIf="vm$ | async as vm">
      <!-- <nav [ngClass]="vm.data ? 'collapse' : 'expand'" [class.collapsed]="vm.data"> -->
      <nav [ngClass]="vm.data ? 'collapse' : 'expand'">
        <header [ngClass]="vm.data ? 'hide' : 'show'">
          <h1>Welcome</h1>
        </header>

        <div>
          <input
            #input
            (input)="input$.next(input.value)"
            (keydown.enter)="onSearch$.next()"
            [value]="input$ | async"
            [disabled]="vm.isLoading"
          />

          <button (click)="onSearch$.next()" [disabled]="vm.isLoading">
            Search
          </button>
        </div>
      </nav>

      <main [ngClass]="vm.data ? 'show' : 'hide'">
        {{ vm.data }}
      </main>
    </ng-container>
  `,
})
export class FooComponent {
  readonly input$ = new BehaviorSubject('')
  readonly onSearch$ = new Subject<void>()

  readonly vm$: Observable<ViewModel> = merge(this.onSearch$).pipe(
    switchMap(() =>
      this.input$.pipe(
        take(1),
        switchMap(input => this._search(input)),
        map(data => ({ isLoading: false, data })),
        startWith({ isLoading: true })
      )
    ),
    startWith({ isLoading: false })
  )

  _search(input: string, ms: number = 1000) {
    return combineLatest({
      input: of(input),
      _: timer(ms),
    }).pipe(map(({ input }) => input))
  }
}
