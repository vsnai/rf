import {
  ChangeDetectionStrategy,
  Component,
  importProvidersFrom,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { LegacySearchComponent } from './app/legacy-search.component'
import { RxSearchComponent } from './app/rx-search.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, LegacySearchComponent, RxSearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<rx-search />`,
})
export class AppRoot {}

bootstrapApplication(AppRoot, {
  providers: [
    importProvidersFrom([
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
    ]),
  ],
})
