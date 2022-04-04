import { HttpContext, HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
// import { AuthService } from "../common/auth.service";
import { catchError, mergeMap, finalize } from 'rxjs/operators';
// import { TokenService } from '../common/token.service';
// import { ToastrService } from 'ngx-toastr';
// import { NgxSpinnerService } from 'ngx-spinner';
const FILE_UPLOAD = new HttpContextToken<boolean>(() => false);
export function fileUpload() {
  return new HttpContext().set(FILE_UPLOAD, true);
}
@Injectable({
  providedIn: 'root'
})
export class AppHttpInterceptor implements HttpInterceptor {
  token: String | null | undefined = localStorage.getItem("token");

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler) {
    let headers: any = {};
    if (this.token) {
      headers["Authorization"] = "Bearer " + this.token;
    }
    let newRequest = request.clone({
      headers: new HttpHeaders(headers)
    });
    return next.handle(newRequest).pipe(catchError(err => {
      if (err instanceof HttpErrorResponse) {
        return throwError(err);
      }
      console.log(err);
      return new Observable<HttpEvent<any>>();
    })
    );
  }
}
