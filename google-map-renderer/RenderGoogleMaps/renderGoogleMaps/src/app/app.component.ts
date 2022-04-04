import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { AppHttpInterceptor } from './app-http-interceptor.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit, OnInit {
  

  // map: any
  center: any = { lat: 50.88051, lng: 4.344425 };
  zoom: any = 8;
  allReports: ReportDto[] | undefined = [];
  allRoutes: any[] | undefined = [];
  @ViewChild(GoogleMap, { static: true }) map: any;
  directionsService!: google.maps.DirectionsService;
  directionsRenderer!: google.maps.DirectionsRenderer;
  
  constructor(
    private reportService: ReportControllerService,
    private favouriteController: FavouriteControllerService,
    private authenticationController: AuthenticationControllerService,
    private interceptorService: AppHttpInterceptor
  ) { }

  ngAfterViewInit(): void { // todo: confirm if we have to keep it to ngAfterViewInit or change it back to ngOnInit
    // this.reportService.getReports().subscribe((data: any) => {
    //   console.log(data);
    //   this.allReports = data;
    // });
  }

  async ngOnInit() {

    this.directionsRenderer = new google.maps.DirectionsRenderer({
      draggable: true,
      markerOptions: {
        draggable: true
      }
    });
    this.directionsRenderer.setMap(this.map.googleMap);
    let credentialsLoginDto: CredentialsLoginDto = {
      password: "$up3r$3cr3tp^ssw@rd" // todo : get from environment variables
    }
    let authenticationDto = await this.authenticationController.loginUserWithCredentials(credentialsLoginDto).toPromise();
    if(authenticationDto?.accessToken != undefined){
      localStorage.setItem("token", authenticationDto?.accessToken);
    }
    this.updateRouteData();
    
  }

  async updateRouteData() {
    // this.reportService.getReports().subscribe((data: any) => {
    //   this.allReports = data.reportList;
    //   data.reportList.forEach(async (e: any) => {
    //     var marker = new google.maps.Marker();
    //     console.log(marker);
    //     marker.setPosition({ lat: e.location[0].latitude!, lng: e.location[0].longitude! });
    //     marker.setMap(this.map.googleMap)
    //   });
    // });
    let reportData = await this.reportService.getReports().toPromise();
    this.allReports = reportData?.reportList;
    console.log(this.allReports);
    this.allReports?.forEach(async (e: any) => {
      var marker = new google.maps.Marker();
      console.log(marker);
      marker.setPosition({ lat: e.location[0].latitude!, lng: e.location[0].longitude! });
      marker.setMap(this.map.googleMap)
    });

    let routesData = await this.favouriteController.loadAllFavouriteRoutesOfAllUsers().toPromise();
    this.allRoutes = routesData?.favouriteRoutesOutputDtoArrayList;
    let pr: any = [];
    this.allRoutes?.forEach((route: any) => {
      pr.push(this.updateRoute(route));
    });
    await Promise.allSettled(pr);
  }

  async updateRoute(route: any) {
    let lineRoute: any[] = [];
    this.directionsRenderer.getDirections()?.routes[0].overview_path.forEach(e => {
      lineRoute.push({ lat: e.lat(), lng: e.lng() });
    });

    // todo : implement project area selection (for fast processing) later

    // // filtering the candidate projects
    // // let candidateProjects = this.allProjects;
    // let candidateProjects = this.allProjects.filter((projectArea: any) => {
    //   let newRoutePoints: google.maps.LatLng[] | undefined = this.directionsRenderer
    //     .getDirections()?.routes[0].overview_path.filter(point => {
    //       return this.kmlService.checkIfanyPointInsidePolygon(point, projectArea.id);
    //     });
    //   return newRoutePoints?.length;
    // });

    let selectedReports: ReportDto[] | undefined  = [];

    // let someVariable = await Promise.all(candidateProjects.map(async (project: any) => {
    //   let response = await this.reportControllerService.getReportByProjectId(project.id).toPromise();

    //   let reports = response?.reportList?.filter((report: any) => {
    //     let reoprtLocations = report.location.filter((item: any) => {
    //       return google.maps.geometry.poly
    //         .isLocationOnEdge(new google.maps.LatLng(item.latitude, item.longitude), new google.maps.Polyline({ path: lineRoute }), 0.0001);
    //     });
    //     return reoprtLocations.length;
    //   });
    //   selectedReports = selectedReports.concat(reports);
    //   return project;
    // }));

    selectedReports = this.allReports?.filter((report: any) => {
      let reoprtLocations = report.location.filter((item: any) => {
        return google.maps.geometry.poly
          .isLocationOnEdge(new google.maps.LatLng(item.latitude, item.longitude), new google.maps.Polyline({ path: lineRoute }), 0.0001);
      });
      return reoprtLocations.length;
    });


     let favouriteRoutesDto: any = {
      "userId": route.userId,
      "name": route.name,
      "positions": route.positions,
      "reports": selectedReports 
    }

    let response = await this.favouriteController.updateFavouriteRoutes(route.id, favouriteRoutesDto).toPromise();
  }

  
}

