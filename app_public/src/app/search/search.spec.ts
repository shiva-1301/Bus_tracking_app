import { ComponentFixture, TestBed } from '@angular/core/testing';

// Import the actual component class
import { SearchComponent } from './search';

// Use the correct component name in the describe block
describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Import the component for testing
      imports: [SearchComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Basic test to ensure the component initializes successfully
    expect(component).toBeTruthy();
  });
});