function Calc(expression){
	var solution =  _calc(expression);

	if((/_?\d+(?:\.\d+)*/).test(solution))
		return expression + " = " + Number(solution.replace("_","-"));
	else return "Something went terribly wrong."

	function _calc(exp){
		var bracketNum = 0;
		var firstBracketIndex = 0;
		for(var c of exp)  						//Get rid of all characters that are not a part of the mathematical expression
			exp = exp.replace(/[^0-9./*+\-()^_]/,"");
		console.log(exp);
		for(var i = 0; i < exp.length; i++){	//Deals with brackets
			if(exp[i] === '('){
				if(bracketNum == 0){
					firstBracketIndex = i;
				}
				bracketNum++;
			}
			if(exp[i] === ')'){
				if(bracketNum == 1){
					exp = exp.replace('(' + exp.substring(firstBracketIndex + 1, i) + ')', _calc(exp.substring(firstBracketIndex + 1, i)));
					console.log('P: ' + exp);
				}
				bracketNum--;
			}
		}
		while((/(_?\d+(?:\.\d+)*)(\^)(_?\d+(?:\.\d+)*)/).test(exp)){		//Deals with exponents
			exp = exp.replace((/(_?\d+(?:\.\d+)?)(\^)(_?\d+(?:\.\d+)?)/).exec(exp)[0], _calculation((/(_?\d+(?:\.\d+)?)(\^)(_?\d+(?:\.\d+)?)/).exec(exp)));
			console.log('E: ' + exp);
		}
		while((/(_?\d+(?:\.\d+)*)([*/])(_?\d+(?:\.\d+)*)/).test(exp)){			//Deals with multiplication, division
			exp = exp.replace((/(_?\d+(?:\.\d+)?)([*/])(_?\d+(?:\.\d+)?)/).exec(exp)[0], _calculation((/(_?\d+(?:\.\d+)?)([*/])(_?\d+(?:\.\d+)?)/).exec(exp)));
			console.log('MD: ' + exp);
		}
		while((/(_?\d+(?:\.\d+)*)([-+])(_?\d+(?:\.\d+)*)/).test(exp)){				//Deals with addition, subtraction
			exp = exp.replace((/(_?\d+(?:\.\d+)?)([+-])(_?\d+(?:\.\d+)?)/).exec(exp)[0], _calculation((/(_?\d+(?:\.\d+)?)([+-])(_?\d+(?:\.\d+)?)/).exec(exp)));
			console.log('AS: ' + exp);
		}
		return exp;
	}

	function _calculation(exp){					//Does the actual math
		switch (exp[2]){
			case '*':
				return (Number(exp[1].replace("_","-")) * Number(exp[3].replace("_","-"))).toFixed(3).replace("-","_");
				break;
			case '/':
				return (Number(exp[1].replace("_","-")) / Number(exp[3].replace("_","-"))).toFixed(3).replace("-","_");
				break;
			case '+':
				return (Number(exp[1].replace("_","-")) + Number(exp[3].replace("_","-"))).toFixed(3).replace("-","_");
				break;
			case '-':
				return (Number(exp[1].replace("_","-")) - Number(exp[3].replace("_","-"))).toFixed(3).replace("-","_");
				break;
			case '^':
				return (Math.pow(Number(exp[1].replace("_","-")), Number(exp[3].replace("_","-")))).toFixed(3).replace("-","_");
				break;
			default:
				return "";
		}
	}
}
module.exports = Calc;