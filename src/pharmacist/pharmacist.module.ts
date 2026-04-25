import { Module } from '@nestjs/common';
import { FirebaseModule } from '../shared/firebase/firebase.module.js';
import { CountersModule } from '../shared/counters/counters.module.js';

import { PharmacistProfileService } from './services/pharmacist-profile.service.js';
import { PharmacistProfileController } from './controllers/pharmacist-profile.controller.js';

import { PharmacistInventoryService } from './services/pharmacist-inventory.service.js';
import { PharmacistInventoryController } from './controllers/pharmacist-inventory.controller.js';

import { PharmacistPatientsService } from './services/pharmacist-patients.service.js';
import { PharmacistPatientsController } from './controllers/pharmacist-patients.controller.js';

import { PharmacistDispensedService } from './services/pharmacist-dispensed.service.js';
import { PharmacistDispensedController } from './controllers/pharmacist-dispensed.controller.js';

import { PharmacistSystemService } from './services/pharmacist-system.service.js';
import { PharmacistSystemController } from './controllers/pharmacist-system.controller.js';

import { PharmacistOrdersService } from './services/pharmacist-orders.service.js';
import { PharmacistOrdersController } from './controllers/pharmacist-orders.controller.js';

import { PharmacistReturnsService } from './services/pharmacist-returns.service.js';
import { PharmacistReturnsController } from './controllers/pharmacist-returns.controller.js';

@Module({
  imports: [FirebaseModule, CountersModule],
  controllers: [
    PharmacistProfileController,
    PharmacistInventoryController,
    PharmacistPatientsController,
    PharmacistDispensedController,
    PharmacistSystemController,
    PharmacistOrdersController,
    PharmacistReturnsController,
  ],
  providers: [
    PharmacistProfileService,
    PharmacistInventoryService,
    PharmacistPatientsService,
    PharmacistDispensedService,
    PharmacistSystemService,
    PharmacistOrdersService,
    PharmacistReturnsService,
  ],
})
export class PharmacistModule {}