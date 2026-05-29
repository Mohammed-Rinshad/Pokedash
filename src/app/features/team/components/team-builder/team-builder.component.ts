import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainerStore } from '../../../../state/trainer.store';
import { PokemonService } from '../../../../core/services/pokemon.service';
import { ToastService } from '../../../../core/services/toast.service';
import { Observable, of, Subject, timer } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, switchMap, takeUntil } from 'rxjs/operators';
import { Pokemon } from '../../../../models/pokemon.model';

@Component({
  selector: 'app-team-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './team-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private trainerStore = inject(TrainerStore);
  private pokemonService = inject(PokemonService);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  
  private destroy$ = new Subject<void>();
  
  public teamForm!: FormGroup;
  public searchResults: Pokemon[] = [];
  public isSearching = false;
  
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.initForm();
    this.setupPokemonSearch();
    this.setupCompetitiveModeToggle();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm() {
    this.teamForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)], [this.uniqueTeamNameValidator.bind(this)]],
      competitiveMode: [false],
      competitiveStats: this.fb.group({
        tier: ['OU'],
        evSpread: [0] // Custom validator will ensure it sums to 510 later if needed, but for now we'll just track it
      }),
      pokemonDetails: this.fb.array([], [this.teamSizeValidator])
    });
    
    // Initial disable of competitiveStats
    this.teamForm.get('competitiveStats')?.disable();
  }

  get pokemonDetails() {
    return this.teamForm.get('pokemonDetails') as FormArray;
  }

  private setupCompetitiveModeToggle() {
    this.teamForm.get('competitiveMode')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(isCompetitive => {
      const statsGroup = this.teamForm.get('competitiveStats');
      if (isCompetitive) {
        statsGroup?.enable();
      } else {
        statsGroup?.disable();
      }
    });
  }

  private setupPokemonSearch() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.isSearching = false;
          this.cdr.markForCheck();
          return of([]);
        }
        this.isSearching = true;
        this.cdr.markForCheck();
        return this.pokemonService.searchPokemon(query.toLowerCase()).pipe(
          catchError(() => of([]))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.searchResults = results;
      this.isSearching = false;
      this.cdr.markForCheck();
    });
  }

  public onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  public addPokemon(pokemon: Pokemon) {
    if (this.pokemonDetails.length >= 6) return;
    
    // Check if already in form
    const exists = this.pokemonDetails.controls.some(ctrl => ctrl.value.pokemonId === pokemon.id);
    if (exists) return;

    this.pokemonDetails.push(this.fb.group({
      pokemonId: [pokemon.id],
      pokemonName: [pokemon.name],
      imageUrl: [pokemon.imageUrl],
      nickname: ['', [Validators.maxLength(20)]],
      heldItem: [''],
      evs: this.fb.group({
        hp: [0, [Validators.min(0), Validators.max(252)]],
        atk: [0, [Validators.min(0), Validators.max(252)]],
        def: [0, [Validators.min(0), Validators.max(252)]],
        spa: [0, [Validators.min(0), Validators.max(252)]],
        spd: [0, [Validators.min(0), Validators.max(252)]],
        spe: [0, [Validators.min(0), Validators.max(252)]]
      }, { validators: [this.evSumValidator] })
    }));
    
    // Clear search
    this.searchResults = [];
  }

  public removePokemon(index: number) {
    this.pokemonDetails.removeAt(index);
  }

  // --- Validators ---

  private evSumValidator(control: AbstractControl): ValidationErrors | null {
    const group = control as FormGroup;
    const hp = group.get('hp')?.value || 0;
    const atk = group.get('atk')?.value || 0;
    const def = group.get('def')?.value || 0;
    const spa = group.get('spa')?.value || 0;
    const spd = group.get('spd')?.value || 0;
    const spe = group.get('spe')?.value || 0;
    
    const sum = hp + atk + def + spa + spd + spe;
    return sum > 510 ? { maxEvsExceeded: true } : null;
  }

  private teamSizeValidator(control: AbstractControl): ValidationErrors | null {
    const array = control as FormArray;
    return array.length >= 1 && array.length <= 6 ? null : { invalidTeamSize: true };
  }

  // Async validator to ensure team name is unique for this trainer
  private uniqueTeamNameValidator(control: AbstractControl): Observable<ValidationErrors | null> {
    return timer(500).pipe(
      map(() => {
        const teams = this.trainerStore.teams();
        const exists = teams.some(t => t.name.toLowerCase() === control.value?.toLowerCase());
        return exists ? { nameTaken: true } : null;
      })
    );
  }

  public submitTeam() {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    const formValue = this.teamForm.getRawValue();
    const nameTaken = this.trainerStore.teams().some(
      t => t.name.toLowerCase() === formValue.name?.toLowerCase()
    );
    if (nameTaken) {
      this.teamForm.get('name')?.setErrors({ nameTaken: true });
      this.teamForm.get('name')?.markAsTouched();
      return;
    }

    const pokemonIds = formValue.pokemonDetails.map((p: any) => p.pokemonId);
    
    this.trainerStore
      .createTeam({
        trainer_id: this.trainerStore.profile()?.id ?? 1,
        name: formValue.name,
        pokemon_ids: pokemonIds,
        created_at: new Date().toISOString(),
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.toast.success('Team saved successfully!'),
        error: () =>
          this.toast.error('Failed to save team. Please try again.'),
      });

    this.teamForm.reset();
    this.pokemonDetails.clear();
    this.teamForm.get('competitiveStats')?.disable();
  }
}
