import { Canvas3D, PlanimetrieModel, PlanimetrieRoom } from 'dm-planimetrie'
import * as THREE from 'three'

function computeRoomBarycenter(room) {
    const box = new THREE.Box3().setFromPoints(room.polygon)
    const barycenter = new THREE.Vector3()

    return box.getCenter(barycenter)
}

async function loadRooms() {
    const { data: rooms } = await (await fetch(`${process.env.MANAGE_API_URL}/public/rooms`)).json()

    // Per ora il formato di "room.polygon" è una stringa json che
    // potenzialmente può essere "null" quindi prima filtriamo rispetto alle
    // stanze con un campo polygon e lo convertiamo in oggetto vero e poi
    // controlliamo che non fosse "null".
    return rooms
        .flatMap(room => (room.polygon ? [{ ...room, polygon: JSON.parse(room.polygon) }] : []))
        .filter(room => room.polygon)
}

async function main() {
    const $canvas = document.querySelector('canvas')

    const canvas3d = new Canvas3D($canvas)

    canvas3d.camera.position.set(-0.3, 5.5, -7)
    canvas3d.scene.background = new THREE.Color(0xffffff)

    const model = new PlanimetrieModel(canvas3d)
    canvas3d.scene.add(model)

    const light = new THREE.AmbientLight(0xdddddd) // soft white light
    canvas3d.scene.add(light)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(1, 2, 3).normalize()
    canvas3d.scene.add(directionalLight)

    let roomObj = null;
    
    const rooms = await loadRooms()
    setInterval(() => {
        const randomRoom = rooms[Math.floor(rooms.length * Math.random())]

        if (roomObj) {
            canvas3d.scene.remove(roomObj);
        }

        roomObj = new PlanimetrieRoom(randomRoom);
        roomObj.setActiveStyle();
        canvas3d.scene.add(roomObj);

        const newTarget = computeRoomBarycenter(randomRoom)

        const dir = canvas3d.camera.position
            .clone()
            .sub(newTarget)
            .setComponent(1, 0)
            .normalize()
            .setComponent(1, Math.tan(Math.PI / 4))
            .normalize()

        const newPosition = newTarget.clone().add(dir.multiplyScalar(0.75))

        canvas3d.animateCamera(newPosition, newTarget, 2 * 1000)
    }, 5 * 1000)
}

main()
