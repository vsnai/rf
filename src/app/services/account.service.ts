import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, catchError, combineLatest, map, of, timer } from 'rxjs'

type CustomerType = 'primary' | 'secondary'

interface Request {
  entries: {
    id: string
    customers: {
      id: string
      name: string
      type: CustomerType
    }[]
  }
}

interface Account {
  id: string
  customers: {
    id: string
    name: string
    type: CustomerType
  }[]
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private _httpClient: HttpClient) {}

  search() {
    //
  }
}
