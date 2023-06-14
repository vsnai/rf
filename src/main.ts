import {
  ChangeDetectionStrategy,
  Component,
  importProvidersFrom,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { bootstrapApplication } from '@angular/platform-browser'
import { LegacySearchComponent } from './app/legacy-search.component'
import { RxSearchComponent } from './app/rx-search.component'
import { FooComponent } from './app/foo.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    LegacySearchComponent,
    RxSearchComponent,
    FooComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<foo-component />`,
})
export class AppRoot {}

bootstrapApplication(AppRoot, {
  providers: [importProvidersFrom([HttpClientModule])],
})
