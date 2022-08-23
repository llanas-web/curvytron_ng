import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { KillLogComponent } from "./kill-log.component";

describe("KillLogComponent", () => {
  let component: KillLogComponent;
  let fixture: ComponentFixture<KillLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [KillLogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KillLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
