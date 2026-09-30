const studentName= "safin";
const marks=[50,80,90];

marks.push(95)
function calculateTotal(marks) {
    let total = 0;

    for (let i= 0;i<marks.length;i++){
    total =total + marks[i];
    }

      return total;
}
function calculateAvarage(total,count){
    return total/count;

}

function calculateGrade(avarage){
    if (avarage >= 80){
        return "B+";
    }
    else if (avarge>=70){
        return "C+";
    }
    else if (avarge>=65){
        return "C";
    }
    else if (avarge>=50){
        return "D";
    }
    else {
        return "C+";
    }
}
function findHighestMark(marks) {
    let highest = marks[0];

    for (let i = 1; i < marks.length; i++) {
        if (marks[i] > highest) {
            highest = marks[i];
        }
    }

    return highest;
}
function countPassedSubjects(marks) {
    let passed = 0;

    for (let i = 0; i < marks.length; i++) {
        if (marks[i] >= 50) {
            passed++;
        }
    }

    return passed;
}
function getResult(passed,count){
    if (passed=count){
        return "pass";
    }
    else{
        return "fail";
    }
}

const total=calculateTotal(marks);
const avarage=calculateAvarge(total,marks.length);
const Grade=calculateGrade(Avarge);
const highest = findHighestMark(marks);
const passedSubjects = countPassedSubjects(marks);
const result = getResult(passedSubjects, marks.length);

console.log("Marks:", marks);
console.log("Marks:", marks);
console.log("Total Marks:", total);
console.log("Average Marks:", average);
console.log("Grade:", grade);
console.log("Result:", result);
console.log("Highest Mark:", highest);
console.log("Passed Subjects:", passedSubjects);


