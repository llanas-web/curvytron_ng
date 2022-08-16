import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss']
})
export class LinkComponent implements OnInit {

  @Output() toggleProfile = new EventEmitter();

  get profileService() {
      return this.profile;
  }

  constructor(private profile: ProfileService) {
  }

  ngOnInit(): void {
  }

  public toggle() {
    this.toggleProfile.emit();
  }
}
