import { ComponentFixture, TestBed } from '@angular/core/testing';

// Corrected: Import the component using its full, correct class name
import { FindBrComponent } from './findbr';

// Corrected: Describe the component using its full class name
describe('FindBrComponent', () => {
  // Corrected: Use the correct type for the component variable
  let component: FindBrComponent;
  let fixture: ComponentFixture<FindBrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Corrected: Import the component using its full class name
      imports: [FindBrComponent] 
    })
    .compileComponents();

    // Corrected: Create the component using its full class name
    fixture = TestBed.createComponent(FindBrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});