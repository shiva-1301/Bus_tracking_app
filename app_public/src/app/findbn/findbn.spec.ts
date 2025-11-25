import { ComponentFixture, TestBed } from '@angular/core/testing';

// Import the actual component class
import { FindBnComponent } from './findbn';

// Use the correct component name in the describe block
describe('FindBnComponent', () => {
  let component: FindBnComponent;
  let fixture: ComponentFixture<FindBnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Import the component for testing
      imports: [FindBnComponent] 
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindBnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Basic test to ensure the component initializes successfully
    expect(component).toBeTruthy();
  });
});
