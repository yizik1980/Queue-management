import { Component, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

interface Tip { icon: string; text: string; }

const HE: { title: string; tips: Tip[]; btn: string } = {
  title: '🎉 נרשמת בהצלחה!',
  tips: [
    { icon: '📅', text: 'לחץ על יום בלוח — כל ריבוע הוא הזמנה שמחכה לך' },
    { icon: '⏰', text: 'תפוס שעה פנויה לפני שמישהו אחר יגנוב אותה 😏' },
    { icon: '✌️', text: 'עד 2 תורים פעילים בו-זמנית. אנחנו נאמנים, לא תאבים' },
  ],
  btn: 'יאללה, בואו נזמן! →',
};

const EN: { title: string; tips: Tip[]; btn: string } = {
  title: '🎉 You\'re all set!',
  tips: [
    { icon: '📅', text: 'Tap any day on the calendar — each square is an invitation' },
    { icon: '⏰', text: 'Grab a free slot before someone else does 😏' },
    { icon: '✌️', text: 'Up to 2 active bookings at a time. We\'re loyal, not greedy' },
  ],
  btn: 'Let\'s book! →',
};

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
})
export class OnboardingComponent {
  readonly dismiss = output<void>();
  private langSvc = inject(LanguageService);
  readonly content = computed(() => this.langSvc.lang() === 'he' ? HE : EN);
}
