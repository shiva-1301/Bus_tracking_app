import { ComponentFixture, TestBed } from '@angular/core/testing';

// Import the actual component class
import { HomeComponent } from './home'; 

// Use the correct component name in the describe block
describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Import the component for testing
      imports: [HomeComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Basic test to ensure the component initializes successfully
    expect(component).toBeTruthy();
  });
});
