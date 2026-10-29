import { useApiStore } from '../store/apiStore';
import { Train } from '../typings/common';

export function getTrainSpeedLimit(train: Train) {
  const apiStore = useApiStore();

  let isPassenger = true;

  // Check the whole consist speed limit
  const vehicleMaxSpeed = train.stockList.reduce((acc, stockName, i) => {
    if (!apiStore.vehiclesData) return acc;

    const [vehicleName, vehicleCargo] = stockName.split(':');

    const vehicle = apiStore.vehiclesData.vehicles.find((v) => v.name == vehicleName);

    if (!vehicle) return acc;

    const vehicleGroup = apiStore.vehiclesData.vehicleGroups.find(
      (g) => g.id == vehicle.vehicleGroupsId
    );

    if (!vehicleGroup) return acc;

    let vehicleSpeed = vehicleGroup.speed;

    if (vehicle.type == 'wagon-freight') {
      isPassenger = false;

      if (vehicleCargo !== undefined && vehicleGroup.speedLoaded) {
        vehicleSpeed = vehicleGroup.speedLoaded;
      }
    }

    return Math.min(vehicleSpeed, acc);
  }, Infinity);

  // Check the head vehicle speed limit
  const headLocoName = train.stockList[0];

  const headLocoVehicle = apiStore.vehiclesData!.vehicles.find((v) => v.name == headLocoName);

  const headLocoVehicleGroup = apiStore.vehiclesData!.vehicleGroups.find(
    (g) => g.id == headLocoVehicle?.vehicleGroupsId
  );

  if (!headLocoVehicleGroup) return vehicleMaxSpeed;

  // Omit speed check for head vehicle if there's no data for it
  if (!headLocoName || !headLocoVehicle || !headLocoVehicleGroup.massSpeeds) return vehicleMaxSpeed;

  const massSpeeds =
    headLocoVehicleGroup.massSpeeds[
      train.stockList.length == 1 ? 'none' : isPassenger ? 'passenger' : 'cargo'
    ];

  // Omit speed check if there's no data on mass speeds
  if (!massSpeeds) return vehicleMaxSpeed;

  // Number type for locomotives alone
  if (typeof massSpeeds === 'number') return massSpeeds;

  // Record type for passenger or cargo, find the closest range

  let largestMassKey: string | null = null;
  for (let massSpeedKey in massSpeeds) {
    if (train.mass >= Number(massSpeedKey)) largestMassKey = massSpeedKey;
  }

  const massMaxSpeed = largestMassKey ? massSpeeds[largestMassKey] : Infinity;

  return Math.min(massMaxSpeed, vehicleMaxSpeed);
}
