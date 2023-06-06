import {
  ChangeDetectionStrategy,
  Component,
  importProvidersFrom,
} from '@angular/core'
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { SearchComponent } from './components/search.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SearchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<search-component />`,
})
export class AppRoot {}

bootstrapApplication(AppRoot, {
  providers: [importProvidersFrom([BrowserModule, BrowserAnimationsModule])],
})
