import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface BusRoute {
  number: string;
  stops: string[];
}

@Injectable({
  providedIn: 'root'
})
export class BusRoutesService {
  // Bus route data
  private busRoutes: BusRoute[] = [
    {
      number: "279",
      stops: [
        "Ibrahimpatnam Bus Station",
        "Sheriguda Bus Stop",
        "Sri Indu Engineering College",
        "Mangalpally X Road",
        "Koheda X Road",
        "Bongulur X Roads Bus Stop",
        "Manneguda X Road",
        "Ragannaguda",
        "Turkyamjal X Road",
        "Injapur Cheruvu Katta",
        "Injapur",
        "Swami Narayana Colony",
        "Sagar Complex Bus Stop",
        "B.N.Reddy Nagar",
        "Hasthinapuram South",
        "Hastinapur North (RTO Office)",
        "Omkar Nagar Bus Stop",
        "Sagar Ring Road",
        "L.B Nagar",
        "Central Bank Colony",
        "Kamineni Hospital Bus Stop",
        "Rajeev Gandhi Nagar",
        "Alkapuri",
        "Mamatha Nagar Colony",
        "Saraswathi Nagar",
        "Uppal Metro Station",
        "Uppal X Roads",
        "Survey Of India",
        "National Geophysical Research Institute (N.G.R.I)",
        "Habsiguda",
        "Tarnaka",
        "Mettuguda",
        "Alugadda Baavi South Bus Stop",
        "Secunderabad/Chilkalguda Circle",
        "Secunderabad Tsrtc Rathifile Bus Station",
        "Sangeeth",
        "Patny",
        "Jubilee Bus Station"
      ]
    },
    {
      number: "300",
      stops: [
        "Bandlaguda",
        "Bandlaguda Chandrayangutta Stop",
        "Oddamguda",
        "Mylardevpally Bus Stop",
        "Durga Nagar Katedan",
        "Durganagar",
        "Babul Reddy Nagar",
        "Aramghar X Roads",
        "Shivarampally X Road",
        "Weaker Section Colony / Shivarampally Quarters",
        "Dairy Farm",
        "Happy Homes Ring Road",
        "Upperpally X Road",
        "Shiva Nagar",
        "Hyderguda X Road",
        "Attapur X Road",
        "Ring Road",
        "Jyothi Nagar",
        "Laxmi Nagar",
        "Rethi Bowli",
        "Mehdipatnam Bus Station",
        "Uppal X Roads",
        "Uppal Metro Station",
        "Inner Ring Road",
        "Nagole",
        "Alkapuri",
        "Rajeev Gandhi Nagar",
        "Kamineni Bus Stop",
        "Kamineni Hospital Bus Stop",
        "Central Bank Colony",
        "L.B Nagar",
        "Sagar X Road",
        "T.K.R.Kaman / Shakti Nagar",
        "Gayatri Nagar",
        "Manda Mallamma Bus Stop",
        "Inner Ring Road - Champapet X Roads",
        "Owaisi Hospital",
        "Midhani Depot",
        "Drdl Bus Stop",
        "Anurag Lab Bus Stop",
        "Kanchanbagh Gate",
        "Baba Nagar",
        "Drdl",
        "Chandrayanagutta",
        "Kesavagiri",
        "Keshavagiri"
      ]
    },
    {
      number: "280",
      stops: [
        "Secunderabad/Chilkalguda Circle",
        "Alugadda Baavi South Bus Stop",
        "Mettuguda",
        "Tarnaka",
        "Habsiguda",
        "National Geophysical Research Institute (N.G.R.I)",
        "Survey Of India",
        "Uppal Sub Station",
        "Uppal Bus Station",
        "Peerjadiguda Kaman",
        "Boduppal X Road",
        "Uppal Bus Depot",
        "Medipally",
        "Central Power Research Institute",
        "Narapally",
        "Vijaypuri Colony",
        "Jodimetla X Road",
        "Annojiguda",
        "Shiva Reddy Guda Bus Stop",
        "Ghatkesar Bus Stop"
      ]
    },
    {
      number: "290U",
      stops: [
        "Chilkalguda",
        "Secunderabad Tsrtc Rathifile Bus Station",
        "Secunderabad Rathifile Bus Station",
        "Secunderabad Railway Station",
        "Secunderabad Bus Station",
        "Clock Tower | Y.C.M.A Secunderabad",
        "JBS",
        "National Geophysical Research Institute (N.G.R.I)",
        "Survey Of India",
        "Uppal X Roads",
        "Uppal X Road",
        "Inner Ring Road",
        "Nagole Metro Station",
        "Nagole",
        "Alkapuri X Road",
        "Rajeev Gandhi Nagar",
        "Kamineni Hospital",
        "Kamineni Hospital Bus Stop",
        "Central Bank Colony",
        "LB Nagar",
        "L.B Nagar",
        "Chintalkunta Check Post",
        "Chintalkunta",
        "Vishnu Theatre",
        "Panama Godown",
        "Sushma Theatre Vanasthalipuram",
        "Autonagar",
        "High Court Colony",
        "Bhagyalatha",
        "Arunodaya Nagar",
        "Hayathnagar Depot",
        "Hayathnagar Bus Station",
        "Word & Deed Colony",
        "Laxma Reddy Palem",
        "Rajasree Vidyamandir School",
        "Pedda Amberpet",
        "Pedda Amberpet X Road",
        "Shanti Nagar",
        "O.R.R. Peddamberpet",
        "O.R.R. Gandicheruvu",
        "Kanakadurga Nagar",
        "S.G.M. College",
        "Ramoji Film City",
        "Abdullapurmet",
        "Jafferguda X Road",
        "Singareni Colony",
        "Mount Opera",
        "Bata Singaram",
        "Sai Nagar Township",
        "Deshmukhi Saint M.College",
        "Deshmukhi"
      ]
    }
  ];

  private busRoutesSubject = new BehaviorSubject<BusRoute[]>(this.busRoutes);
  public busRoutes$ = this.busRoutesSubject.asObservable();

  constructor() { 
    console.log('BusRoutesService initialized with', this.busRoutes.length, 'routes');
  }

  getBusRoutes(): BusRoute[] {
    return this.busRoutes;
  }

  getBusRouteByNumber(busNumber: string): BusRoute | undefined {
    return this.busRoutes.find(route => route.number === busNumber);
  }

  // Find buses that travel between two stops
  findBusesBetweenStops(from: string, to: string): BusRoute[] {
    console.log('Searching for buses between', from, 'and', to);
    const result = this.busRoutes.filter(route => {
      // Find stops that match or closely match the input (case insensitive)
      const fromNormalized = from.toLowerCase().replace(/\s+/g, '');
      const toNormalized = to.toLowerCase().replace(/\s+/g, '');
      
      let fromIndex = -1;
      let toIndex = -1;
      
      // Find the best matching from stop
      for (let i = 0; i < route.stops.length; i++) {
        const stopNormalized = route.stops[i].toLowerCase().replace(/\s+/g, '');
        if (stopNormalized.includes(fromNormalized) || fromNormalized.includes(stopNormalized)) {
          fromIndex = i;
          break;
        }
      }
      
      // Find the best matching to stop
      for (let i = 0; i < route.stops.length; i++) {
        const stopNormalized = route.stops[i].toLowerCase().replace(/\s+/g, '');
        if (stopNormalized.includes(toNormalized) || toNormalized.includes(stopNormalized)) {
          toIndex = i;
          break;
        }
      }
      
      // Check if both stops exist in the route and from comes before to
      const isValid = fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
      console.log('Route', route.number, 'fromIndex:', fromIndex, 'toIndex:', toIndex, 'isValid:', isValid);
      if (isValid) {
        console.log('Found matching route:', route.number, 'from:', route.stops[fromIndex], 'to:', route.stops[toIndex]);
      }
      return isValid;
    });
    console.log('Found', result.length, 'matching buses');
    return result;
  }
}