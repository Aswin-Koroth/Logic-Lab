
function lerp(A, B, v){
    return A+(B-A)*v;
}

function remove(element, list, count = 1){
    while (count > 0){
        let i = list.indexOf(element);
        if (i<0){
            break;
        }
        list.splice(i, 1);
        count--;
    }
}
