import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { FrameworkComponent } from './app/framework.component/framework.component'; // Import FrameworkComponent

// Bootstrap FrameworkComponent instead of AppComponent
bootstrapApplication(FrameworkComponent, appConfig)
  .catch((err) => console.error(err));
