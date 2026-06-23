import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastComponent } from './features/toast/toast.component';
import { NotificationService } from './core/services/notification.service';
import { SplashComponent } from './features/splash/splash.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent, SplashComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  readonly title      = 'scheduler-frontend';
  private themeSvc    = inject(ThemeService);
  private notifSvc    = inject(NotificationService);

  ngOnInit(): void {
    this.themeSvc.loadSaved();
    this.notifSvc.requestPermission();
  }
}
